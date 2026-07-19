using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace Identity.API.Services;

public class RsaKeyService
{
    private readonly RSA _rsa;

    public RsaKeyService()
    {
        _rsa = RSA.Create(2048);
    }

    public RsaSecurityKey GetKey()
    {
        return new RsaSecurityKey(_rsa) { KeyId = "instashop-key-1" };
    }

    public RSA GetRsa() => _rsa;
}
