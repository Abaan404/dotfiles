local M = {
    _is_nixos = nil,
}

function M.is_nixos()
    if M._is_nixos == nil then
        local f = io.open("/etc/os-release", "r")
        if f then
            local content = f:read("*all")
            f:close()
            M._is_nixos = content:match("ID=nixos") ~= nil
        else
            M._is_nixos = false
        end
    end
    return M._is_nixos
end

return M
