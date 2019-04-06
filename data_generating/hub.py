class Hub:
    def __init__(self, id, position, nodes):
        self.id = id
        self.position = position.tolist()
        self.nodes = nodes

    def update_position(self, localization):
        self.position = localization
