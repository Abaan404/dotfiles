{ pkgs, inputs, ... }:

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

    extraPackages = [
      inputs.astal.packages.${pkgs.system}.astal3
      inputs.astal.packages.${pkgs.system}.io
      inputs.astal.packages.${pkgs.system}.apps
      inputs.astal.packages.${pkgs.system}.auth
      inputs.astal.packages.${pkgs.system}.battery
      inputs.astal.packages.${pkgs.system}.hyprland
      inputs.astal.packages.${pkgs.system}.mpris
      inputs.astal.packages.${pkgs.system}.network
      inputs.astal.packages.${pkgs.system}.bluetooth
      inputs.astal.packages.${pkgs.system}.powerprofiles
      inputs.astal.packages.${pkgs.system}.tray
      inputs.astal.packages.${pkgs.system}.wireplumber
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
