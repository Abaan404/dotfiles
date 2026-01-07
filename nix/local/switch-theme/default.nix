{ pkgs }:

let
  pythonEnv = pkgs.python312.withPackages (ps: [
    ps.python-dotenv
    ps.requests
    ps.pywal
    ps.pillow
  ]);
in
pkgs.stdenv.mkDerivation {
  pname = "switch-theme";
  version = "1.0.0";
  src = ./.;

  installPhase = ''
    mkdir -p $out/bin
    install -Dm644 switch-theme.py $out/share/switch-theme.py

    makeWrapper ${pythonEnv}/bin/python $out/bin/switch-theme \
      --add-flags $out/share/switch-theme.py
  '';

  nativeBuildInputs = [ pkgs.makeWrapper ];
}
