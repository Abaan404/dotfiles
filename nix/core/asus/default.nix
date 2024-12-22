{ ... }:

{
  # Shared config for an asus laptop
  imports = [
    ./hardware-configuration.nix
    ./services.nix
  ];
}
