{ ... }:

{
  # Shared config for every system
  imports = [
    ./boot.nix
    ./shell.nix
    ./locale.nix
    ./packages.nix
    ./security.nix
    ./services.nix
    ./networking.nix
    ./system.nix
    ./users.nix
  ];
}
