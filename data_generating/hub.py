class Hub:
    def __init__(self, id, position, nodes):
        self.id = id
        self.position = position.tolist()
        self.nodes = nodes
        self.surprise_factor = 0

    def update_position(self, localization):
        self.position = localization
