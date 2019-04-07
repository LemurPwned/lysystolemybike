from backend_server.algo import Algo
from data_generating.node import Node
from data_generating.hub import Hub
from data_generating.generator import OUNoise
from data_generating.greedy_here import HereAPI
import numpy as np
import matplotlib.pyplot as plt


class Storage:
    def __init__(self, hub_number, time_window, node_number):
        self.maths = Algo(hub_number)
        self.source = HereAPI()

        centers, res = self.source.sample(node_number)

        self._nodes = [Node(i, c, r)
                       for c, r, i in zip(centers, res, range(len(res)))]
        self.cracow_center = np.array([50, 19.9])

        self._hubs = []
        self.time_window = time_window
        self.time = 0
        self.day_of_week = "mon"
        self.random_source = [OUNoise((1), np.random.randint(0, 1024), mu=0.1, theta=0.15, sigma=0.2) for i in
                              range(node_number)]

    def init_nodes(self):
        for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]:
            for i in range(48):
                self.update_nodes()
            for n in self._nodes:
                n.history[day] = n.history["today"]

        print("Nodes initalised")

    def get_data(self):
        return self._nodes, self._hubs

    def get_data_and_trigger_algo(self):
        self.update_nodes()
        self.time += 1
        if self.time == 48:
            self.time = 0
            [src.reset() for src in self.random_source]

        for node in self._nodes:
            running_average = np.mean(
                list(node.history[self.day_of_week])[:-self.time_window])

            aux = self.maths.calculate_node_severity(
                node.history["today"], self.time_window, self.time, running_average)

            node.update_severity(aux)
            node.running_average = aux

            aux, sigma3 = self.maths.three_sigma_test(list(node.history["today"]),
                list(node.history[self.day_of_week]), self.time_window, self.time)

            node.set_surprise_factor(aux)

            node.sigma3 = sigma3

        hubs, nodes = self.maths.designate_hubs(self._nodes)
        self._hubs = [Hub(i, h, []) for i, h in enumerate(hubs)]

        for i, node in enumerate(nodes):
            self._hubs[node].nodes.append(i)
            self._hubs[node].surprise_factor += np.around(
                self._nodes[i].surprise_factor, 2)

        print("Returning")
        return self._nodes, self._hubs

    def update_nodes(self):
        for i in range(len(self._nodes)):
            self._nodes[i].update_day(self.random_source[i].sample())


if __name__ == "__main__":
    storage = Storage(1, 5, 30)
    plt.figure()
    storage.init_nodes()
    # while True:
    node = storage.get_data_and_trigger_algo()[0][0]
    storage.update_nodes()
    plt.plot([i for i in range(len(node.history["today"]))],
             node.history["today"], "b")

    def mean(i): return np.mean(
        list(node.history[storage.day_of_week])[i:i + storage.time_window])
    r_mean = [mean(i) for i in range(len(node.history["today"]))]
    plt.plot([i for i in range(len(r_mean))], r_mean, "r")
    plt.xlim(0, 48)
    plt.show()
