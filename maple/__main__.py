import argparse
import ast
import code
import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import pandas as pd
from tqdm import tqdm

from maple.classification import regex_classification
from maple.db import connect
from maple.types import (Action, ActionType, Bill, Branch, Committee,
                         UnknownValue)
from maple.util import parse_datetime


def parse_bills(bills_file: Path) -> list[Bill]:
    """Load all bills from a CSV file.

    The file is assumed to have the following columns:

    action
      The raw text describing the action

    branch
      The branch of government taking the action

    date
      When the action occurred.

    Parameters
    ----------

    bills_file
        The CSV file containing the bills to load.

    Returns
    -------

    A list of all bills found in the file.

    """

    with open(bills_file, "r") as f:
        bill_actions = defaultdict(list)

        for row in csv.DictReader(f, delimiter=","):
            action = Action(
                action=row["action"],
                branch=Branch[row["branch"].lower()],
                when=parse_datetime(row["date"]),
                committee=UnknownValue(""),
            )
            bill_actions[row["id"]].append(action)

        return [Bill(id=k, history=v) for k, v in bill_actions.items()]


def load_command(args: argparse.Namespace) -> None:
    with connect(args.db_path) as db:
        for bill in tqdm(parse_bills(args.bills_file), unit="bills"):
            db.add_bill(bill)


def dump_command(args: argparse.Namespace) -> None:
    with connect(args.db_path) as db:

        actions = {}
        bill_ids = {}
        action_labels = defaultdict(list)
        for (action_id, bill_id, action, labels) in db.actions_and_labels():
            actions[action_id] = action
            bill_ids[action_id] = bill_id
            action_labels[action_id].extend([label.value for label in labels])

        rows = []
        for action_id in actions:
            action = actions[action_id]
            labels = action_labels[action_id]

            match action.committee:
                case Committee(name=name):
                    committee=name
                case UnknownValue(name=_):
                    committee="unknown"
                case _:
                    committee="unknown"

            rows.append(
                {
                    "action_id": action_id,
                    "labels": labels,
                    "bill_id": bill_ids[action_id],
                    "branch": action.branch.value,
                    "action": action.action,
                    "when": action.when,
                    "committee": committee,
                }
            )

        pd.DataFrame(rows).to_csv(args.labels_file, index=False)


def regex_command(args: argparse.Namespace) -> None:
    with connect(args.db_path) as db:

        ids = []
        actions = []
        predictions = []
        labels = []

        for id, _, action, labels in db.actions_and_labels():
            for label in labels:
                predicted = regex_classification(action)
                ids.append(id)
                actions.append(action.action)
                predictions.append(predicted.value)
                labels.append(label.value if label is not None else None)

        df = pd.DataFrame(
            data={
                "action_id": ids,
                "action": actions,
                "prediction": predictions,
                "label": labels,
            }
        )

        if args.predictions_file is not None:
            df.to_csv(args.predictions_file, index=False)

        correct = len(df[df.prediction == df.label])
        incorrect = len(df[(df.prediction != df.label) & ~pd.isna(df.label)])

        print(f"{correct} correct predictions, {incorrect} incorrect predictions")

        by_prediction = df.groupby("prediction").size().sort_values(ascending=False)
        print()
        print("Prediction counts:")
        print(by_prediction)

        types = []
        labeleds = []
        corrects = []
        incorrects = []
        precisions = []
        recalls = []
        f1s = []

        for type in (x.value for x in ActionType):
            correct = len(df[(df.prediction == type) & (df.label == type)])
            incorrect = len(
                df[(df.prediction == type) & (df.label != type) & ~pd.isna(df.label)]
            )

            precision = correct / max(1, correct + incorrect)

            size = len(df[df.label == type])
            if size == 0:
                recall = 1
            else:
                recall = correct / size

            if precision > 0 and recall > 0:
                f1 = 1 / (1 / precision + 1 / recall)
            else:
                f1 = 0

            types.append(type)
            labeleds.append(size)
            corrects.append(correct)
            incorrects.append(incorrect)
            precisions.append(precision)
            recalls.append(recall)
            f1s.append(f1)

        scores = pd.DataFrame(
            data={
                "label": types,
                "labeled": labeleds,
                "correct": corrects,
                "incorrect": incorrects,
                "precision": precisions,
                "recall": recalls,
                "f1": f1s,
            }
        )

        scores.sort_values("f1")
        print(scores)


def label_command(args: argparse.Namespace) -> None:
    with connect(args.db_path) as db:
        df = pd.read_csv(args.labels_file)
        df.labels = df.labels.map(ast.literal_eval)
        db.relabel(
            zip(df.action_id, df.labels.map(lambda xs: [ActionType[x] for x in xs]))
        )


def drop_labels_command(args: argparse.Namespace) -> None:
    print("Do you really want to drop all labels? This cannot be undone ")
    answer = input("y/n: ")

    if answer != "y":
        print("Canceled")
        raise SystemExit(1)

    with connect(args.db_path) as db:
        db.drop_labels()


def repl_command(args: argparse.Namespace) -> None:
    with connect(args.db_path) as db:
        code.interact(local=locals())


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    subparsers = parser.add_subparsers()

    load = subparsers.add_parser(
        "load-bills", help="load bills into a new or existing database"
    )
    load.add_argument("--db-path", type=Path, required=True)
    load.add_argument("--bills-file", type=Path, required=True)
    load.set_defaults(func=load_command)

    dump = subparsers.add_parser("dump-labels", help="export labels to a CSV file")
    dump.add_argument("--db-path", type=Path, required=True)
    dump.add_argument("--labels-file", type=Path, required=True)
    dump.set_defaults(func=dump_command)

    regex = subparsers.add_parser(
        "predict-regex", help="predict action types for actions in the database"
    )
    regex.add_argument("--db-path", type=Path, required=True)
    regex.add_argument("--predictions-file", type=Path, required=False)
    regex.set_defaults(func=regex_command)

    drop_labels = subparsers.add_parser(
        "drop-labels", help="drop all labels, please be careful"
    )
    drop_labels.add_argument("--db-path", type=Path, required=True)
    drop_labels.set_defaults(func=drop_labels_command)

    label = subparsers.add_parser("label", help="update labels stored in the database")
    label.add_argument("--db-path", type=Path, required=True)
    label.add_argument("--labels-file", type=Path, required=True)
    label.set_defaults(func=label_command)

    repl = subparsers.add_parser(
        "repl", help="enter a REPL with a database connection active"
    )
    repl.add_argument("--db-path", type=Path, required=True)
    repl.set_defaults(func=repl_command)

    args = parser.parse_args()

    args.func(args)
