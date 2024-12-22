{ ... }:

{
  # https://gitlab.com/doronbehar/nix-matlab
  xdg.configFile."matlab/nix.sh".text = ''
    INSTALL_DIR=$HOME/downloads/software/matlab/installation
  '';
}
