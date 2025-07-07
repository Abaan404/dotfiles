set dotenv-load

install system:
    # create system-specific config
    mkdir -p ./nix/core/{{system}}
    echo -e '{ ... }:\n\n{\n    imports = [\n        ./hardware-configuration.nix\n    ];\n}' > ./nix/core/{{system}}/default.nix
    cp /etc/nixos/hardware-configuration.nix ./nix/core/{{system}}

    # add a nixosConfigurations entry into flake.nix
    grep -q "{{system}} =" ./flake.nix && exit 0 || awk -v conf={{system}} '1; /nixosConfigurations = {/ {print "        " conf " = nixpkgs.lib.nixosSystem {\n          inherit system;\n\n          specialArgs = {\n            username = \"abaan404\";\n\n            inherit inputs;\n            inherit pkgs-unstable;\n          };\n\n          modules = [\n            ./nix/core/common\n            ./nix/core/" conf "\n          ];\n        };\n"}' ./flake.nix > tmp && mv tmp ./flake.nix

    # add to git bc nix doesnt like it when you dont
    git add ./nix/core/{{system}}/*
    git add ./flake.nix

    # save the current system
    echo "SYSTEM={{system}}" >> ./.env

    # switch to new dots
    just switch

    # copy default wallpapers
    install -m 644 -v -D $(readlink -f $(which Hyprland) | cut -c-59)/share/hypr/wall* -t ~/Pictures/wallpapers/

    # load configs
    python3 ./scripts/reload.py

    echo "Installation Completed. Run 'Hyprland' as a command to begin"

switch-nixos:
    @if [[ -z "${SYSTEM-}" ]]; then \
        echo "No system configuration found, either rerun \`just install\` or add your \$SYSTEM into your .env that matches your nixosConfigurations system"; \
        exit 1; \
    fi

    sudo nixos-rebuild switch --flake .#"$SYSTEM"

switch-hm:
    home-manager switch --flake ~/.dotfiles

switch:
    just switch-nixos
    just switch-hm

rollback:
    sudo nixos-rebuild switch --rollback

update:
    nix flake update
    just switch

gc:
    # why cant both be one command?
    sudo nix-collect-garbage -d
    nix-collect-garbage -d

