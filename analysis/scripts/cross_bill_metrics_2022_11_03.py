"""This script demonstrates some cross-bill metric analysis, including 
estimation of the following parameters for the 2021-2022 session:

* Average residence time per bill status
* Average residence time per bill status per committee
* Probability of a bill being enacted per status
* Probability of a bill being enacted per status per committee
* Fraction of bills enacted from each committee that did not get hearings
* Fraction of bills enacted referred to each committee that get passed
* Number of bills referred to each committee
"""

from matplotlib import pyplot as plt
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd

# NOTE - it's good to order these in terms of the sequence of the stage.
# That ordering will be preserved in plots.
DATA_FILES: Dict[str, Path] = {
    'reported_referred': Path('../data/2022_11_03_reported-referred.zip'),
    'hearing_scheduled': Path('../data/2022_11_03_hearing_scheduled.zip'),
    'enacted': Path('../data/2022_11_03_enacted.zip'),
}
STATUSES: List[str] = list(DATA_FILES.keys())


def load_data(data_files: Dict[str, Path]) -> Dict[str, pd.DataFrame]:
    """Load each data file and return a dictionary of DataFrames.
    """
    dfs = {}
    for fname, fpath in data_files.items():
        dfs[fname] = pd.read_json(fpath)
    return dfs

def sanitize_committee_names(x: str) -> str:
    """Sanitize the name of a committe by making it title case and dropping prefixes.
    """
    if isinstance(x, float) and np.isnan(x):
        return x
    return remove_prefix(x, 'the committee on ').title()

def remove_prefix(s: str, prefix: str):
    """Backport of remove_prefix from python 3.9
    """
    if s.startswith(prefix):
        return s[len(prefix):]
    return s

def process_data(dfs: Dict[str, pd.DataFrame]) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Process the data loaded by `load_data` and combine the status-specific records into a single DataFrame.
    
    Two versions of this DataFrame are exported; the first records exact timestamps and the second records
    durations.
    
    The data frames will have this format, where each cell records euther the datestamp or the number of days since
    the first (left most) status was reached.
    
        id  status_1    status_2    ...
        X   0           60
        Y   0           45
        Z   0           33
        ...
    """
    out_df = pd.concat(dfs, names=['status']).reset_index()
    # Committee name is only provided in reported_referred. Use this to make a mapping we will join in later
    committee_map = dfs['reported_referred'].groupby('id')['committee_name'].first()
    # Keep only first record per status. A few bills will have multiple records 
    # assigned to each status, and we want to know when they first reached that stage.
    # We aggregate branch and committee_name with nanmax to arbitrarily choose a non-null value.
    out_df = out_df.groupby(['id', 'status'])['date'].min().reset_index()
    # Pivot so that we have one row per bill, one column per status
    out_df = out_df.pivot(index=['id'], columns='status', values='date')
    out_df['committee_name'] = committee_map.reindex(out_df.index).apply(sanitize_committee_names)
    # Calculate time in days since the first status
    first_status = STATUSES[0]
    out_df_days = out_df.apply(lambda x: (pd.to_datetime(x[STATUSES]) - x[first_status]).dt.days, axis=1)
    return out_df, out_df_days

def get_nonnull_indeces(pds: pd.Series) -> List[Any]:
    """Take a pandas Series and return a list of indexes whose values are not null.
    """
    return pds.isnull().pipe(lambda x: x[x]).index.get_level_values(0).to_list()

def log_quality_checks(df_date: pd.DataFrame, df_days: pd.DataFrame) -> None:
    """
    """
    print("\n\nThe following bills apparently had hearings or were referred after they were enacted; impossible!")
    print(df_date[(df_days<0).any(axis=1)])
    
    print("\n\nThe following bills all have a non-null enacted date, and yet are missing referral dates; impossible!")
    print(get_nonnull_indeces(df_date[~df_date['enacted'].isnull()]['reported_referred']))
    
    print('\n\nThese committee names appeared <5 times and are likely to be poorly parsed')
    print(df_date['committee_name'].value_counts().pipe(lambda x: x[x<5]))

def plot_residence_dist_per_status(df_date: pd.DataFrame):
    """Distribution of residence time per bill status.
    """
    fig, axs = plt.subplots(len(STATUSES) - 1, figsize=(4 * (len(STATUSES) - 1), 4), sharex='all')
    for status_i, status in enumerate(STATUSES[1:], start=1):
        dist = (df_date[status] - df_date[STATUSES[status_i-1]]).dt.days.dropna()
        axs[status_i - 1].hist(dist, bins=20)
        axs[status_i - 1].set_title(f'{STATUSES[status_i - 1]} --> {STATUSES[status_i]}')
        axs[status_i - 1].axvline(np.mean(dist), ls='dashed', color='0.5', label='Mean')
    axs[0].legend()
    fig.supxlabel('Duration in status (days)')
    fig.supylabel('# of bills')
    plt.savefig('residence_dist_per_status.png', dpi=300)
    plt.close()

def shorten(x: List[str], length: int=20) -> List[str]:
    """Shorten the labels in `x` to a maximum length of `length`.
    """
    return [(label if len(label) < length else label[:length] + '...') for label in x]

def plot_residence_avg_per_status_per_committee(df_date: pd.DataFrame, min_bills: int=15):
    """Average residence time per bill status per committee.
    """
    sel_committees = sorted(df_date['committee_name'].value_counts().pipe(lambda x: x[x >= min_bills].index))
    df_sel = df_date[df_date['committee_name'].isin(sel_committees)]
    fig, axs = plt.subplots(len(STATUSES) - 1, figsize=(4 * (len(STATUSES) - 1), 8), sharex='all')
    for status_i, status in enumerate(STATUSES[1:], start=1):
        # calculate duration in this status
        dist = (df_sel[status] - df_sel[STATUSES[status_i-1]]).dt.days
        # group by committee
        dist_group = pd.Series(index=df_sel['committee_name'].values, data=dist.values).groupby(level=0)
        # calculate average
        avg_duration = dist_group.mean().loc[sel_committees]
        # calculate number of bills in each committee with dates recorded
        num_bills = dist_group.apply(lambda x: (~np.isnan(x)).sum()).loc[sel_committees]
        x = np.arange(len(avg_duration))
        axs[status_i - 1].bar(x, avg_duration)
        for i in range(len(x)):
            axs[status_i - 1].text(x[i], avg_duration[i], f'N={num_bills[i]}'
                                   , ha='center', va='bottom', size=6)
        axs[status_i - 1].set_title(f'{STATUSES[status_i - 1]} --> {STATUSES[status_i]}')
    plt.xticks(x, shorten(sel_committees), rotation=45, ha='right', fontsize=8)
    fig.supxlabel('Committee')
    fig.supylabel('Average duration in status (days)')
    plt.tight_layout()
    plt.savefig('residence_avg_per_status_per_committee.png', dpi=300)
    plt.close()

def plot_fraction_enacted_per_committee(df_date: pd.DataFrame, min_bills: int=15):
    """Plot the fraction of bills referred to each committee that get enacted
    """
    sel_committees = sorted(df_date['committee_name'].value_counts().pipe(lambda x: x[x >= min_bills].index))
    df_referrred_group = df_date.pipe(lambda x: x[~x['reported_referred'].isnull()]).groupby('committee_name')
    perc_enacted = 100 * (1 - df_referrred_group['enacted'].apply(lambda x: x.isnull().mean())).loc[sel_committees]
    num_bills = df_referrred_group['reported_referred'].apply(lambda x: (~x.isnull()).sum()).loc[sel_committees]
    x = np.arange(len(perc_enacted))
    fig = plt.figure()
    
    plt.bar(x, perc_enacted)
    for i in range(len(x)):
        plt.text(x[i], perc_enacted[i], f'N={num_bills[i]}'
                                , ha='center', va='bottom', size=6)
    plt.xticks(x, shorten(sel_committees), rotation=45, ha='right', fontsize=8)
    fig.supxlabel('Committee')
    fig.supylabel('Fraction of bills referred --> enacted (%)')
    plt.tight_layout()
    plt.savefig('fraction_enacted_per_committee.png', dpi=300)
    plt.close()

# TODO
#* Probability of a bill being enacted per status
#* Probability of a bill being enacted per status per committee
#* Fraction of bills enacted from each committee that did not get hearings
#* Number of bills referred to each committee

def main():
    """Run all analysis
    """
    df_date, df_days = process_data(load_data(DATA_FILES))
    log_quality_checks(df_date, df_days)
    plot_residence_dist_per_status(df_date)
    plot_residence_avg_per_status_per_committee(df_date)
    plot_fraction_enacted_per_committee(df_date)
    import pdb; pdb.set_trace()

if __name__ == '__main__':
    main()

