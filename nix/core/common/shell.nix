{ pkgs, ... }:

{
  # set zsh as default
  environment.shells = [ pkgs.zsh ];
  users.defaultUserShell = pkgs.zsh;

  # enable git
  programs.git.enable = true;

  programs.appimage = {
    enable = true;
    binfmt = true;
  };

  programs.zsh = {
    enable = true;
    autosuggestions.enable = true;
    syntaxHighlighting.enable = true;

    ohMyZsh = {
      enable = true;
      theme = "juanghurtado";
      plugins = [
        "git"
        "sudo"
      ];
    };
  };
}
