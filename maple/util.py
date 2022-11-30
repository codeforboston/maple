from datetime import datetime


def parse_datetime(dt: str) -> datetime:
    """Parse a datetime string.

    Examples
    --------

    >>> parse_datetime("2021-02-25T16:46:19.933Z")
    datetime.datetime(2021, 2, 25, 16, 46, 19, 933000)

    >>> parse_datetime("2021-04-15T04:00:00.000Z")
    datetime.datetime(2021, 4, 15, 4, 0)

    """

    return datetime.strptime(dt, "%Y-%m-%dT%H:%M:%S.%fZ")
