{ pkgs, pkgs-unstable, ... }:

{
  home.packages = [
    # editors
    pkgs-unstable.neovim
    pkgs.jetbrains.idea-community
    pkgs.vscodium
    pkgs.kate

    # C/C++
    # pkgs.clang
    pkgs.clang-tools
    pkgs.valgrind
    pkgs.gnumake
    pkgs.cmake
    pkgs.ninja
    pkgs.meson

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
    pkgs.vscode-extensions.vscjava.vscode-java-debug
    pkgs.openjdk21
    # pkgs.jdk17
    # pkgs.jdk8

    # verilog
    pkgs.quartus-prime-lite
    pkgs.verible

    # debugging
    pkgs.vscode-extensions.vadimcn.vscode-lldb.adapter
    pkgs.gdb
    pkgs.lldb
    pkgs.wireshark

    # lsp
    pkgs-unstable.typescript-language-server
    pkgs-unstable.bash-language-server
    pkgs-unstable.typst-lsp
    pkgs-unstable.mesonlsp
    pkgs-unstable.jdt-language-server
    pkgs.dockerfile-language-server-nodejs
    pkgs.docker-compose-language-service
    pkgs.vscode-langservers-extracted
    pkgs.kotlin-language-server
    pkgs.matlab-language-server
    pkgs.cmake-language-server
    pkgs.yaml-language-server
    pkgs.vim-language-server
    pkgs.lua-language-server
    pkgs.glsl_analyzer
    pkgs.asm-lsp
    pkgs.pyright
    pkgs.texlab
    pkgs.nil

    # formatters
    pkgs-unstable.typstfmt
    pkgs.nixfmt-rfc-style
    pkgs.prettierd
    pkgs.eslint_d
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
