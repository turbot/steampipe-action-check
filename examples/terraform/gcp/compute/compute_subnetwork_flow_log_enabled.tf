resource "google_compute_subnetwork" "compute_subnetwork_flow_log_enabled" {
  name          = "log-test-subnetwork"
  ip_cidr_range = "10.2.0.0/16"
  region        = "us-central1"
  network       = google_compute_network.compute_subnetwork_flow_log_enabled_test.id

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

resource "google_compute_network" "compute_subnetwork_flow_log_enabled_test" {
  name                    = "log-test-network"
  auto_create_subnetworks = false
}
