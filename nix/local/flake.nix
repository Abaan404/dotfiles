{
  description = "theme switcher";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
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
            pyPkgs.colorthief
          ];
        };

        packages.switch-theme = pkgs.callPackage ./switch-theme/default.nix { };
        packages.ninjabrainbot = pkgs.callPackage ./ninjabrainbot/default.nix { };
      }
    );
}
