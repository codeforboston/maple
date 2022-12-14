"""Support moving data into and out of the database.

In an ideal world, we'd directly store and retrieve objects from the
`maple.types` module. However, these types don't map perfectly to a relational
database (e.g. a `Bill` has a list of `Action`s associated with it, and we need
to represent this with a join.) To that end, we introduce new types with an 'M'
suffix (for 'Model') that act as a wrapper around the associated object for use
with the database. Types with the 'F' suffix indicate custom field types, and
are used to provide some type safety when reading from and writing to the
database.

As an example of a model, consider the `ActionM` class. This model represents
an `Action` in the ORM; each class has similar fields, where possible. Note
that `ActionM` stores an index value, `seq_num`, that is missing from `Action`;
this is because this value is derived from an `Action`s position in a
`Bill.history` list. Likewise, `ActionM` has a `bill_id` field used to
establish a relationship to a `BillM` that isn't present in `Action`, since
such back-references in pure Python are usually unnecessary.

As an example of a field, consider the `BranchF` class. This represents a
database column storing an element of the `Branch` enumeration. (Some databases
directly support custom enumeration types; SQLite3 isn't one of them.)

"""


import logging
from collections import defaultdict
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Iterator, List, Type

import peewee as pw

from maple.types import (
    Action,
    ActionType,
    Bill,
    Branch,
    Committee,
    Status,
    UnknownValue,
)

# Aside for those using MyPy: the peewee package doesn't seem to be properly
# typed, and MyPy is panicking on many statements that seem to run just fine.
# Forgive the many `type: ignore` comments.

logger = logging.getLogger(__name__)

# Defer initialization of the Peewee database until we actually need it.
_database = pw.SqliteDatabase(None)


class BaseModel(pw.Model):
    class Meta:
        database = _database


class StatusF(pw.Field):
    field_type = "Status"

    def db_value(self, value: Status) -> str:
        return value.value

    def python_value(self, value: str) -> Status | UnknownValue:
        try:
            return Status[value]
        except KeyError:
            return UnknownValue(value)


class ActionTypeF(pw.Field):
    field_type = "ActionType"

    def db_value(self, value: ActionType) -> str:
        return value.value

    def python_value(self, value: str) -> ActionType | UnknownValue:
        try:
            return ActionType[value]
        except KeyError:
            return UnknownValue(value)


class BranchF(pw.Field):
    field_type = "Branch"

    def db_value(self, value: Branch) -> str:
        return value.value

    def python_value(self, value: str) -> Branch | UnknownValue:
        try:
            return Branch[value]
        except KeyError:
            return UnknownValue(value)


class CommitteeF(pw.Field):
    field_type = "Committee"

    def db_value(self, value: Committee) -> str:
        return value.name

    def python_value(self, value: str) -> Committee | UnknownValue:
        if value is None:
            return UnknownValue("unknown")
        return Committee(value)


class BillM(BaseModel):
    """The table of bills."""

    class Meta:
        table_name = "bills"

    id = pw.TextField(primary_key=True)


class ActionM(BaseModel):
    """The table of actions."""

    class Meta:
        table_name = "actions"

    id = pw.AutoField()
    bill_id = pw.ForeignKeyField(BillM, backref=Meta.table_name)
    branch = BranchF()
    seq_num = pw.IntegerField()
    action = pw.TextField()
    when = pw.DateTimeField()
    committee = CommitteeF(null=True)

    def to_action(self) -> Action:
        return Action(
            action=self.action,  # type: ignore
            branch=self.branch,  # type: ignore
            when=self.when,  # type: ignore
            committee=self.committee,  # type: ignore
        )


class LabelM(BaseModel):
    """A bill action and its status label."""

    class Meta:
        table_name = "labels"

    id = pw.AutoField()
    action = pw.ForeignKeyField(ActionM, backref=Meta.table_name)
    label = ActionTypeF()


@dataclass(frozen=True)
class TrainingDB:
    def class_counts(self) -> dict[Action, int]:
        counts = defaultdict(int)

        for action in ActionM.select().iterator():
            counts[action] += 1

        return counts

    def relabel(self, labels: Iterable[tuple[int, List[ActionType]]]) -> None:
        """Drop existing labels, and apply new ones. """

        with _database.atomic() as transaction:
            try:
                for action_id, action_labels in labels:
                    # Drop existing labels for the action
                    LabelM.delete().where(LabelM.action_id == action_id).execute()  # type: ignore

                    # Apply new labels for this action
                    for action_label in action_labels:
                        LabelM.create(action=action_id, label=action_label)
            except:
                transaction.rollback()
                raise
            finally:
                transaction.commit()

    def label(self, actionM: ActionM, action_type: Type[Action]) -> LabelM:
        return LabelM.create(action=actionM, label=type(action_type).__name__)

    def add_bill(self, bill: Bill) -> BillM:

        # If the bill already exists, drop it and recreate
        try:
            BillM.get(BillM.id == bill.id).delete_instance(recursive=True)
        except pw.DoesNotExist:
            pass

        billM = BillM.create(id=bill.id)

        # Create the associated actions
        for i, action in enumerate(bill.history):
            ActionM.create(
                bill_id=billM.id,
                seq_num=i,
                branch=action.branch,
                action=action.action,
                when=action.when,
            )

        return billM

    def actions_and_labels(
        self,
    ) -> Iterator[tuple[int, int, Action, List[ActionType]]]:
        actions = (
            (ActionM)
            .select(ActionM, LabelM)
            .join(
                LabelM, on=(ActionM.id == LabelM.action), join_type=pw.JOIN.LEFT_OUTER
            )
            .iterator()  # type: ignore
        )

        for actionm in set(actions):
            action = actionm.to_action()

            yield actionm.id, actionm.bill_id, action, [
                label.label for label in actionm.labels
            ]

    def drop_labels(self) -> None:
        LabelM.delete().execute()


@contextmanager
def connect(db_path: Path) -> Iterator[TrainingDB]:
    _database.init(db_path)
    _database.create_tables([BillM, ActionM, LabelM])

    yield TrainingDB()
