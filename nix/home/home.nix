{
  flake-overlays,
  username,
  ...
}:

{
  imports = [
    ./packages/hyprland.nix
    ./packages/desktop.nix
    ./packages/cli.nix
    ./packages/dev.nix
    ./files/matlab.nix
    ./scripts.nix
  ];

  nixpkgs.overlays = [
    (final: prev: {
      # Your own overlays...
    })
  ] ++ flake-overlays;

  home.username = username;
  home.homeDirectory = "/home/${username}";
  home.stateVersion = "24.05";

  home.sessionVariables = {
    EDITOR = "nvim";
    CMAKE_GENERATOR = "Ninja Multi-Config";
    NIXOS_OZONE_WL = "1";
    # NIX_BUILD_SHELL = "zsh"; # messes up nix-shell environments
  };

  programs.git = {
    enable = true;
    lfs.enable = true;

    extraConfig = {
      init.defaultBranch = "main";
      url = {
        "git@github.com:" = {
          insteadOf = "gh:";
        };
      };
    };
  };

  programs.home-manager.enable = true;
}
