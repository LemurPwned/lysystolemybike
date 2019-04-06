from backend_server.algo import Algo
from data_generating.node import Node
from data_generating.hub import Hub
from data_generating.generator import OUNoise
import numpy as np
import matplotlib.pyplot as plt


class Storage:
    def __init__(self, hub_number, time_window, node_number):
        self.maths = Algo(hub_number)
        self._nodes = [Node(i, np.random.random((2)) * 2 - 1, 0) for i in range(node_number)]
        self._hubs = []
        self.time_window = time_window
        self.time = 0
        self.day_of_week = "mon"
        self.source = [OUNoise((1), 42, mu=0., theta=0.15, sigma=0.2) for i in range(node_number)]

    def init_nodes(self):
        for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]:
            for i in range(48):
                self.update_nodes()
            for n in self._nodes:
                n.history[day] = n.history["today"]

    def get_data(self):
        return self._nodes, self._hubs

    def get_data_and_trigger_algo(self):
        self.update_nodes()
        self.time += 1

        if self.time == 48:
            self.time = 0
            [self.source[i].reset() for i in range(len(self.source))]

        for node in self._nodes:
            node.update_severity(self.maths.updateNodeSeverity(
                node.history["today"], self.time_window, self.time, node.history[self.day_of_week][-1]))

            node.set_surprise_factor(self.maths.three_sigma_test(
                list(node.history["today"]), list(node.history[self.day_of_week]), self.time_window, self.time))

        hubs, nodes = self.maths.designate_hubs(self._nodes)
        self._hubs = [Hub(i, h, []) for i, h in enumerate(hubs)]

        for i, node in enumerate(nodes):
            self._hubs[node].nodes.append(id)

        return self._nodes, self._hubs

    def update_nodes(self):
        for i in range(len(self._nodes)):
            self._nodes[i].update_day(self.source[i].sample())


if __name__ == "__main__":
    storage = Storage(10, 5, 50)
    plt.figure()
    storage.init_nodes()

    while True:
        node = storage.get_data_and_trigger_algo()[0][0]
        # storage.update_nodes()
        plt.plot([i for i in range(len(node.history["today"]))], node.history["today"], "b")
        plt.ylim(0, 1)
        plt.xlim(0, 48)
        plt.pause(0.01)
        plt.cla()
        plt.draw()
