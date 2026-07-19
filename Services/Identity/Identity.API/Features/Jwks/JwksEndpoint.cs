using Carter;
using Identity.API.Services;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

namespace Identity.API.Features.Jwks;

public class JwksEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/.well-known/jwks.json", (RsaKeyService keyService) =>
        {
            var key = keyService.GetKey();
            var parameters = key.Rsa.ExportParameters(false);
            
            var jwk = new
            {
                kty = "RSA",
                alg = "RS256",
                use = "sig",
                kid = key.KeyId,
                n = Base64UrlEncoder.Encode(parameters.Modulus),
                e = Base64UrlEncoder.Encode(parameters.Exponent)
            };

            return Results.Ok(new { keys = new[] { jwk } });
        });

        app.MapGet("/.well-known/openid-configuration", (HttpRequest request) =>
        {
            return Results.Ok(new
            {
                issuer = "Instashop-Identity",
                jwks_uri = $"{request.Scheme}://{request.Host}/.well-known/jwks.json",
                id_token_signing_alg_values_supported = new[] { "RS256" }
            });
        });
    }
}
