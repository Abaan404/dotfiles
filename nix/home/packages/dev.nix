{ pkgs, pkgs-unstable, ... }:

{
  home.packages = [
    # editors
    pkgs-unstable.neovim
    pkgs.jetbrains.idea-community
    pkgs.vscodium
    pkgs.kdePackages.kate

    # C/C++
    # pkgs.clang
    pkgs.clang-tools
    pkgs.valgrind
    pkgs.gnumake
    pkgs.cmake
    pkgs.ninja
    pkgs.meson
    pkgs.just

    # rust
    pkgs.cargo

    # web
    pkgs.dart-sass
    pkgs.nodejs
    pkgs.gcc
    pkgs.bun

    # matlab
    pkgs.octave
    pkgs.matlab

    # java
    pkgs-unstable.gradle
    pkgs.openjdk21
    # pkgs.jdk17
    # pkgs.jdk8

    # verilog
    pkgs.quartus-prime-lite
    pkgs.verible

    # debugging
    pkgs.vscode-extensions.vadimcn.vscode-lldb.adapter
    pkgs.vscode-extensions.vscjava.vscode-java-debug
    pkgs.gdb
    pkgs.lldb
    pkgs.wireshark

    # lsp
    pkgs.vala-language-server
    pkgs.typescript-language-server
    pkgs.bash-language-server
    pkgs.mesonlsp
    pkgs.jdt-language-server
    pkgs.dockerfile-language-server-nodejs
    pkgs.docker-compose-language-service
    pkgs.vscode-langservers-extracted
    pkgs.tailwindcss-language-server
    pkgs.kotlin-language-server
    pkgs.matlab-language-server
    pkgs.cmake-language-server
    pkgs.yaml-language-server
    pkgs.vim-language-server
    pkgs.lua-language-server
    pkgs.glsl_analyzer
    pkgs.tinymist
    pkgs.asm-lsp
    pkgs.pyright
    pkgs.hyprls
    pkgs.texlab
    pkgs.nixd

    # formatters
    pkgs.nodePackages.prettier
    pkgs-unstable.typstyle
    pkgs-unstable.eslint_d
    pkgs.nixfmt-rfc-style
    pkgs.stylua
    pkgs.black

    # treesitter
    pkgs.tree-sitter
  ];

  programs.kitty = {
    enable = true;

    shellIntegration.enableZshIntegration = true;

    font = {
      name = "JetBrainsMono Nerd Font";
      size = 11;
    };

    settings = {
      scrollback_lines = 10000;
      enable_audio_bell = false;
      update_check_interval = 0;
      window_margin_width = 10;
      background_opacity = "0.5";
      term = "xterm-256color";
    };
  };
}
