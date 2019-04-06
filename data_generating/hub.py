class Hub:
    def __init__(self, id, position, nodes):
        self.id = id
        self.position = None
        self.nodes = nodes

    def update_position(self, localization):
        self.position = localization
