{
  description = "theme switcher";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        pyPkgs = pkgs.python312Packages;
      in
      {
        devShells.${system}.default = pkgs.mkShell {
          buildInputs = [
            pyPkgs.python-dotenv
            pyPkgs.requests
            pyPkgs.pywal
            pyPkgs.pillow
          ];
        };
        packages.default = pyPkgs.buildPythonApplication {
          pname = "switch-theme";
          version = "1.0.0";
          src = ./.;

          format = "other";

          propagatedBuildInputs = [
            pyPkgs.python-dotenv
            pyPkgs.requests
            pyPkgs.pywal
            pyPkgs.pillow
          ];

          installPhase = ''
            mkdir -p $out/bin
            cp switch-theme.py $out/bin/switch-theme
            chmod +x $out/bin/switch-theme
          '';
        };
      }
    );
}
