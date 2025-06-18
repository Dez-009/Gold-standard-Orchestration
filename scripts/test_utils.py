# Notes: Provide simple wait helper for tests
import time
from typing import Callable, TypeVar

T = TypeVar('T')

def wait_for_condition(fn: Callable[[], T], check: Callable[[T], bool], delay: float = 0.2, retries: int = 5) -> T:
    """Call ``fn`` until ``check`` returns True or retries exhausted."""
    for _ in range(retries):
        result = fn()
        if check(result):
            return result
        time.sleep(delay)
    return fn()
