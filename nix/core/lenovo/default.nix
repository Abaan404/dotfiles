{ ... }:

{
  # Shared config for a lenovo laptop
  imports = [
    ./hardware-configuration.nix
    ./services.nix
    ./shell.nix
    ./boot.nix
  ];
}
