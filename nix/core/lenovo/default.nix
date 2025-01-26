{ ... }:

{
  # Shared config for a lenovo laptop
  imports = [
    ./hardware-configuration.nix
    ./services.nix
    ./packages.nix
    ./shell.nix
    ./boot.nix
  ];
}
