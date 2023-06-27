# Set working dir to ~/.dotfiles

mkdir ~/.dotfiles
cd ~/.dotfiles

function install_lenovo_service {
    sudo cp ./systemd/lenovo-profile.service /etc/systemd/system/lenovo-profile.service
    sudo cp ./systemd/lenovo-profile /usr/bin/lenovo-profile
    sudo chmod +x /usr/bin/lenovo-profile
    sudo systemctl enable --now lenovo-profile &
}

install_lenovo_service
