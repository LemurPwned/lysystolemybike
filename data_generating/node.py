from collections import defaultdict, deque
import numpy as np


class Node:
    def __init__(self, id, localization, severity):
        self.id = id
        print("Node:", localization)
        self.position = localization
        self.history = defaultdict(lambda: deque(maxlen=48))
        self.severity = severity
        self.surprise_factor = 0

    def update_severity(self, severity):
        self.severity = severity

    def finish_day(self, day):
        hist = self.history[day]
        new_history = np.mean((self.history["today"], hist))
        self.history[day] = new_history

    def update_day(self, data):
        self.history["today"].append(data[0])

    def set_surprise_factor(self, val):
        self.surprise_factor = val


if __name__ == "__main__":
    a = Node(0, 0, 0)
    a.history["today"] = np.ones(48)
    a.finish_day("friday")
    a.history["today"] = np.zeros(48)
    a.finish_day("friday")
    assert a.history["friday"][0] - 0.25 < 1e-6, print(a.history["friday"][0])
    print("update_history test passed")
