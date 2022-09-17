resource "google_compute_subnetwork" "compute_subnetwork_private_ip_google_access" {
  name = "ipv6-test-subnetwork"

  ip_cidr_range = "10.0.0.0/22"
  region        = "us-west2"

  stack_type       = "IPV4_IPV6"
  ipv6_access_type = "EXTERNAL"

  private_ip_google_access = true

  network = google_compute_network.compute_subnetwork_private_ip_google_access_test.id
}

resource "google_compute_network" "compute_subnetwork_private_ip_google_access_test" {
  name                    = "ipv6-test-network"
  auto_create_subnetworks = false
}
