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
    pkgs.hyprpolkitagent

    # launcher
    pkgs.rofi-wayland

    # wallpaper
    inputs.swww.packages.${pkgs.system}.swww

    # notifications
    pkgs.dunst
    pkgs.libnotify

    # onscreen keyboard
    pkgs.wvkbd

    # misc
    pkgs.wev
    inputs.envycontrol.packages.${pkgs.system}.envycontrol
  ];

  programs.ags = {
    enable = true;

    extraPackages = [
      pkgs.libsoup_3
      pkgs.glib-networking
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
      inputs.astal.packages.${pkgs.system}.notifd
    ];
  };

  wayland.windowManager.hyprland = {
    enable = true;
    settings = {
      "$mainMod" = "SUPER";
    };

    extraConfig = ''
      monitor=,preferred,auto,1
      monitor=eDP-1,preferred,auto,1,transform,0

      source=~/.config/hypr/environment.conf
      source=~/.config/hypr/scripts.conf
      source=~/.config/hypr/keybinds.conf
      source=~/.config/hypr/rules.conf
      source=~/.config/hypr/animations.conf
      source=~/.config/hypr/hyprgrass.conf
    '';

    plugins = [
      pkgs.hyprlandPlugins.hyprgrass
    ];
  };
}
