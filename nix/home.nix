flake-overlays:

{ config, inputs, ... }:

{
  imports = [
    ./packages/hyprland.nix
    ./packages/desktop.nix
    ./packages/python3.nix
    ./packages/cli.nix
    ./packages/dev.nix

    ./files/matlab.nix

    inputs.ags.homeManagerModules.default
  ];

  nixpkgs.overlays = [
    (final: prev: {
      # Your own overlays...
    })
  ] ++ flake-overlays;

  home.username = "abaan404";
  home.homeDirectory = "/home/abaan404";
  home.stateVersion = "24.05";

  home.packages = [ inputs.envycontrol.packages.x86_64-linux.default ];

  home.sessionVariables = {
    EDITOR = "nvim";
    CMAKE_GENERATOR = "Ninja Multi-Config";
    NIXOS_OZONE_WL = "1";
    # NIX_BUILD_SHELL = "zsh"; # messes up nix-shell environments
  };

  programs.git = {
    enable = true;
    lfs.enable = true;
    userName = "abaan404";
    userEmail = "67100191+Abaan404@users.noreply.github.com";
  };

  programs.home-manager.enable = true;
}
