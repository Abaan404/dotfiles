{ pkgs, pkgs-unstable, ... }:

{
  home.packages = [
    pkgs-unstable.gpu-screen-recorder
    pkgs.brightnessctl
    pkgs.wl-clipboard
    pkgs.ffmpeg-full
    pkgs.xdg-utils
    pkgs.playerctl
    pkgs.quickemu
    pkgs.killall
    pkgs.glxinfo
    pkgs.ripgrep
    pkgs.unzip
    pkgs.p7zip
    pkgs.cava
    pkgs.wget
    pkgs.qemu
    pkgs.file
    pkgs.curl
    pkgs.tree
    pkgs.bat
    pkgs.fzf
    pkgs.jq
    pkgs.fd
    pkgs.bc
  ];

  programs.fastfetch = {
    enable = true;
  };

  services.playerctld = {
    enable = true;
  };

  programs.btop = {
    enable = true;
    settings = {
      color_theme = "tokyo-night";
      theme_background = false;
      graph_symbol = "block";
    };
  };

  programs.zsh = {
    enable = true;
    autosuggestion.enable = true;
    syntaxHighlighting.enable = true;

    oh-my-zsh = {
      enable = true;
      theme = "fox";
      plugins = [
        "git"
        "sudo"
      ];
    };

    shellAliases = {
      vim = "nvim";
      nivm = "nvim";
      nvmi = "nvim";
      vnim = "nvim";

      lla = "ls -la";
    };
  };
}
