{
  description = "abaan404's NixOS dotfiles";

  inputs = {
    # nixpkgs
    nixpkgs.url = "github:nixos/nixpkgs/nixos-26.05";
    nixpkgs-unstable.url = "github:nixos/nixpkgs/nixos-unstable";
    nix-flatpak.url = "github:gmodena/nix-flatpak/?ref=latest";

    # astal/ags
    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };

    # HM config
    home-manager = {
      url = "github:nix-community/home-manager/release-26.05";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # zen-browser (see: https://github.com/NixOS/nixpkgs/pull/363992#pullrequestreview-2523997020)
    zen-browser = {
      url = "github:0xc000022070/zen-browser-flake";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.home-manager.follows = "home-manager";
    };

    # locally maintained packages
    local = {
      url = "path:./nix/local";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # preconfig hardware
    nixos-hardware.url = "github:NixOS/nixos-hardware/master";
  };

  outputs =
    {
      nixpkgs,
      nixpkgs-unstable,
      home-manager,
      ...
    }@inputs:
    let
      system = "x86_64-linux";

      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };

      pkgs-unstable = import nixpkgs-unstable {
        inherit system;
        config.allowUnfree = true;
      };
    in
    {
      nixosConfigurations = {
        asus = nixpkgs.lib.nixosSystem {
          inherit system;

          specialArgs = {
            username = "abaan404";

            inherit inputs;
            inherit pkgs-unstable;
          };

          modules = [
            ./nix/core/common
            ./nix/core/asus
          ];
        };

        lenovo = nixpkgs.lib.nixosSystem {
          inherit system;

          specialArgs = {
            username = "abaan404";

            inherit inputs;
            inherit pkgs-unstable;
          };

          modules = [
            inputs.nixos-hardware.nixosModules.lenovo-ideapad-15arh05
            ./nix/core/common
            ./nix/core/lenovo
          ];
        };
      };

      homeConfigurations = {
        abaan404 = home-manager.lib.homeManagerConfiguration {
          inherit pkgs;

          extraSpecialArgs = {
            username = "abaan404";

            inherit inputs;
            inherit pkgs-unstable;
          };

          modules = [
            inputs.ags.homeManagerModules.default
            inputs.nix-flatpak.homeManagerModules.nix-flatpak

            ./nix/home/home.nix
            {
              programs.git.settings.user = {
                name = "abaan404";
                email = "67100191+Abaan404@users.noreply.github.com";
              };
            }
          ];
        };
      };
    };
}
