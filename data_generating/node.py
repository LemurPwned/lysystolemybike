from collections import defaultdict
import numpy as np

class Node:
    def __init__(self, id, localization, severity):
        self.id = id
        self.localization = localization
        self.history = defaultdict(lambda: np.zeros(shape=(48)))
        self.severity = severity

    def update_severity(self, severity):
        self.severity = severity

    def update_day_history(self, day):
        hist = self.history[day]
        new_history = np.mean((self.history["today"], hist))
        self.history[day] = new_history

if __name__=="__main__":
    a = Node(0,0,0)
    a.history["today"] = np.ones(48)
    a.update_day_history("friday")
    a.history["today"] = np.zeros(48)
    a.update_day_history("friday")
    assert a.history["friday"][0]-0.25<1e-6, print(a.history["friday"][0])
    print("update_history test passed")