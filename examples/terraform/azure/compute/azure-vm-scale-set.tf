resource "azurerm_resource_group" "named_test_resource" {
  name     = "testing"
  location = "East US"
}

resource "azurerm_virtual_network" "named_test_resource" {
  name                = "test123"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.named_test_resource.location
  resource_group_name = azurerm_resource_group.named_test_resource.name
}

resource "azurerm_subnet" "named_test_resource" {
  name                 = "test45"
  resource_group_name  = azurerm_resource_group.named_test_resource.name
  virtual_network_name = azurerm_virtual_network.named_test_resource.name
  address_prefix       = "10.0.2.0/24"
}

resource "azurerm_public_ip" "named_test_resource" {
  name                = "test45"
  location            = azurerm_resource_group.named_test_resource.location
  resource_group_name = azurerm_resource_group.named_test_resource.name
  allocation_method   = "Static"
  domain_name_label   = azurerm_resource_group.named_test_resource.name

  tags = {
    Name = "test45"
  }
}

resource "azurerm_lb" "named_test_resource" {
  name                = "test45"
  location            = azurerm_resource_group.named_test_resource.location
  resource_group_name = azurerm_resource_group.named_test_resource.name

  frontend_ip_configuration {
    name                 = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.named_test_resource.id
  }
}

resource "azurerm_linux_virtual_machine_scale_set" "named_test_resource" {
  name                = "test45"
  location            = azurerm_resource_group.named_test_resource.location
  resource_group_name = azurerm_resource_group.named_test_resource.name

  sku = "Standard_F2"

  instances      = 1
  admin_username = "adminuser"

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "16.04-LTS"
    version   = "latest"
  }

  os_disk {
    storage_account_type = "Standard_LRS"
    caching              = "ReadWrite"
  }

  network_interface {
    name    = "example"
    primary = true

    ip_configuration {
      name      = "internal"
      primary   = true
      subnet_id = azurerm_subnet.named_test_resource.id
    }
  }
}

resource "azurerm_windows_virtual_machine_scale_set" "named_test_resource_2" {
  name                = "example-vmss"
  resource_group_name = azurerm_resource_group.named_test_resource.name
  location            = azurerm_resource_group.named_test_resource.location
  sku                 = "Standard_F2"
  instances           = 1
  admin_password      = "P@55w0rd1234!"
  admin_username      = "adminuser"

  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2016-Datacenter-Server-Core"
    version   = "latest"
  }

  os_disk {
    storage_account_type = "Standard_LRS"
    caching              = "ReadWrite"
  }

  network_interface {
    name    = "example"
    primary = true

    ip_configuration {
      name      = "internal"
      primary   = true
      subnet_id = azurerm_subnet.named_test_resource.id
    }
  }
}
