from backend_server.algo import Algo
from data_generating.node import Node
from data_generating.generator import OUNoise

class Storage:
    def __init__(self, hub_number, time_window, node_number):
        self.maths = Algo(hub_number)
        self._nodes = [Node(i, np.random.random((2))*2-1, 0) for i in range(node_number)]
        self._hub = []
        self.time_window = time_window
        self.time = 0
        self.day_of_week = "mon"
        self.source = [OUNoise((1), 42, mu=0., theta=0.15, sigma=0.2) for i in range(node_number)]

    def get_data(self):
        return self._nodes, self._hub

    def get_data_and_trigger_algo(self):
        self.update_nodes()

        for node in self._nodes:
            node.update_severity(self.maths.updateNodeSeverity(
                node.history["today"], self.time_window, self.time, node.history[self.day_of_week]))

            node.set_surprise_factor(self.maths.three_sigma_test(
                node.history["today"], node.history[self.day_of_week], self.time_window, self.day_of_week))

        hubs, nodes = self.maths.designate_hubs(self._nodes)
        self._hub = hubs
        for i, node in enumerate(nodes):
            self._hub[node].nodes.append(id)

        return self._nodes, self._hub

    def update_nodes(self):
        for i in range(len(self._nodes)):
            self._nodes[i].update_day(self.source[i].sample())