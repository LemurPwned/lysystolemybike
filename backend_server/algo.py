import numpy as np
from sklearn.cluster import KMeans, AffinityPropagation
import tqdm


class Algo:
    def __init__(self, hub_number):
        self.running_average = 0.0
        self.hub_number = hub_number
        self.type = 'affinity'
        self.cluster_size = 5
        self.time_period = 5
        self.clf = KMeans(n_clusters=self.hub_number)

    def calculate_node_severity(self, time_series, time_window, current_time, running_average):
        """
        time series => time series for today
        """
        # calculate SAD
        # return SAD
        if current_time < time_window:
            time_window = current_time
        past_time = current_time - time_window
        n = len(time_series)
        running_average = running_average + \
            time_series[current_time]/n + time_series[past_time]/n
        return running_average

    def three_sigma_test(self, time_series, past_time_series, time_window, current_time):
        """
        past time series => historic representation of past time series
        current time series => historic representation of past time series
        time widnow => calculation window
        """
        if current_time < time_window:
            time_window = current_time
        past_time_series_windowed = past_time_series[current_time-time_window:]
        past_time_series_3sigma = 3*np.var(past_time_series_windowed)
        past_mean = np.mean(past_time_series_windowed)

        current_time_series_windowed = time_series[current_time-time_window:]
        current_time_series_3sigma = 3*np.var(current_time_series_windowed)
        current_mean = np.mean(current_time_series_windowed)

        if (current_mean + current_time_series_3sigma) > (past_mean + past_time_series_3sigma):
            return np.around((current_mean + current_time_series_3sigma) - (past_mean + past_time_series_3sigma), 2), current_time_series_3sigma
        elif(current_mean - current_time_series_3sigma) < (past_mean - past_time_series_3sigma):
            return np.around((past_mean - past_time_series_3sigma) - (current_mean - current_time_series_3sigma), 2), current_time_series_3sigma
        else:
            return 0.0, current_time_series_3sigma

    def deg2rad(self, deg):
        return deg * np.pi/180

    def calc_distance(self, lat1, lon1, lat2, lon2, s1, s2):
        R = 6371
        dlat = (lat2-lat1)*np.pi/180
        dlon = (lon2-lon1)*np.pi/180
        a = np.sin(dlat/2) * np.sin(dlat/2) + np.cos(lat1*np.pi/180) * \
            np.cos(lat2*np.pi/180) * np.sin(dlon/2) * np.sin(dlon/2)
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
        d = R * c
        return (s1*s2)/d

    def designate_hubs(self, node_list):
        """
        create node matrix
        clf -> classifier class
        """
        if self.type == 'affinity':
            kmeans_matrix = np.empty(shape=(len(node_list), len(node_list)))
            # kmeans_weight = np.empty(shape=(len(node_list), ))
            for i in range(len(node_list)):
                # kmeans_weight[i] = node_list[i].severity
                for j in range(i):
                    kmeans_matrix[i, j] = self.calc_distance(
                        *node_list[i].position, *node_list[j].position, node_list[i].severity, node_list[j].severity)
                    kmeans_matrix[j, i] = kmeans_matrix[i, j]
            clf_2 = AffinityPropagation(convergence_iter=25, max_iter=300,
                                        affinity='precomputed')
            clf_2.fit_predict(kmeans_matrix)
            node_labels = clf_2.labels_
            indices = clf_2.cluster_centers_indices_
            hub_centers = [np.array([*node_list[index].position])
                           for index in indices]
        else:
            kmeans_matrix = np.empty(shape=(len(node_list), 2))
            kmeans_weight = np.empty(shape=(len(node_list), ))
            for i, node in enumerate(node_list):
                severity = node.severity
                position = node.position
                kmeans_matrix[i, :] = np.array([*position])
                kmeans_weight[i] = severity
            self.clf.fit_predict(
                kmeans_matrix, sample_weight=kmeans_weight)
            node_labels = self.clf.labels_
            hub_centers = self.clf.cluster_centers_
        return hub_centers, node_labels


if __name__ == "__main__":
    alg = Algo(5)
    ts1 = np.random.random(size=(1000,))
    ts2 = np.random.random(size=(1000, ))
    run1 = alg.calculate_node_severity(ts1, 100, 60, 0)
    run2 = alg.calculate_node_severity(ts1, 100, 200, run1)
    print(f"Run 1 {run1}, run 2 {run2}")
    surprise, _ = alg.three_sigma_test(ts1, ts2, 100, 300)
    print(surprise)
