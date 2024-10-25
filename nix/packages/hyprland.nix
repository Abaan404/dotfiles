{ pkgs, ... }:

{
  home.packages = [
    # hyprutils
    pkgs.hyprpicker
    pkgs.hyprlock
    pkgs.hypridle
    pkgs.pyprland

    # screenshot
    pkgs.swappy
    pkgs.slurp
    pkgs.grim

    # polkit
    pkgs.kdePackages.polkit-kde-agent-1
    pkgs.kdePackages.kirigami
    pkgs.kdePackages.qtwayland

    # launcher
    pkgs.rofi-wayland

    # wallpaper
    pkgs.swww

    # notifications
    pkgs.dunst
    pkgs.libnotify

    # misc
    pkgs.wev
  ];

  programs.ags = {
    enable = true;

    # additional packages to add to gjs's runtime
    extraPackages = [
      pkgs.gtksourceview
      pkgs.webkitgtk
      pkgs.accountsservice
    ];
  };

  wayland.windowManager.hyprland = {
    enable = true;
    settings = {
      "$mainMod" = "SUPER";
    };

    extraConfig = ''
      monitor=,preferred,auto,1

      source=~/.config/hypr/environment.conf
      source=~/.config/hypr/scripts.conf
      source=~/.config/hypr/keybinds.conf
      source=~/.config/hypr/rules.conf
      source=~/.config/hypr/animations.conf
    '';
  };
}
