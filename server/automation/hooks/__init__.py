# Hook engine registries
from typing import Callable, Dict

action_checkers: Dict[str, Callable] = {}
reaction_executors: Dict[str, Callable] = {}

def register_action(name: str):
    def deco(fn: Callable):
        action_checkers[name] = fn
        return fn
    return deco

def register_reaction(name: str):
    def deco(fn: Callable):
        reaction_executors[name] = fn
        return fn
    return deco
