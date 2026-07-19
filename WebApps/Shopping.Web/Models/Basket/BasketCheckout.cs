using System.Text.Json.Serialization;

namespace Shopping.Web.Models.Basket;

public class BasketCheckoutModel
{
    [JsonPropertyName("userName")]
    public string UserName { get; set; } = default!;
    
    [JsonPropertyName("customerId")]
    public Guid CustomerId { get; set; } = default!;
    
    [JsonPropertyName("totalPrice")]
    public float TotalPrice { get; set; } = default!;
    
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = default!;
    
    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = default!;
    
    [JsonPropertyName("emailAddress")]
    public string EmailAddress { get; set; } = default!;
    
    [JsonPropertyName("country")]
    public string Country { get; set; } = default!;
    
    [JsonPropertyName("addressLine")]
    public string AddressLine { get; set; } = default!;
    
    [JsonPropertyName("state")]
    public string State { get; set; } = default!;
    
    [JsonPropertyName("zipCode")]
    public string ZipCode { get; set; } = default!;
    
    [JsonPropertyName("cardName")]
    public string CardName { get; set; } = default!;
    
    [JsonPropertyName("cardNumber")]
    public string CardNumber { get; set; } = default!;
    
    [JsonPropertyName("expiration")]
    public string Expiration { get; set; } = default!;
    
    [JsonPropertyName("cvv")]
    public string CVV { get; set; } = default!;
    
    [JsonPropertyName("paymentMethod")]
    public int PaymentMethod { get; set; } = default!;
}

public record CheckoutBasketRequest([property: JsonPropertyName("basketCheckoutDto")] BasketCheckoutModel BasketCheckoutDto);
public record CheckoutBasketResponse(bool IsSuccess);