using System.Text.Json.Serialization;

namespace Shopping.Web.Models.Basket;

public class ShoppingCartModel
{
    [JsonPropertyName("userName")]
    public string UserName { get; set; } = default!;
    
    [JsonPropertyName("items")]
    public List<ShoppingCartItemModel> Items { get; set; } = new();
    
    [JsonPropertyName("totalPrice")]
    public float TotalPrice => Items.Sum(x => x.Price * x.Quantity);
}

public class ShoppingCartItemModel
{
    [JsonPropertyName("quantity")]
    public int Quantity { get; set; } = default!;
    
    [JsonPropertyName("color")]
    public string Color { get; set; } = default!;
    
    [JsonPropertyName("price")]
    public float Price { get; set; } = default!;
    
    [JsonPropertyName("productId")]
    public Guid ProductId { get; set; } = default!;
    
    [JsonPropertyName("productName")]
    public string ProductName { get; set; } = default!;
}

public record GetBasketResponse([property: JsonPropertyName("cart")] ShoppingCartModel Cart);
public record StoreBasketRequest([property: JsonPropertyName("cart")] ShoppingCartModel Cart);
public record StoreBasketResponse(string UserName);
public record DeleteBasketResponse(bool Issuccess);
public record AddItemRequest([property: JsonPropertyName("item")] ShoppingCartItemModel Item);
public record AddItemResponse([property: JsonPropertyName("cart")] ShoppingCartModel Cart);
public record RemoveItemResponse([property: JsonPropertyName("cart")] ShoppingCartModel Cart);
public record UpdateItemQuantityRequest([property: JsonPropertyName("quantity")] int Quantity);
public record UpdateItemQuantityResponse([property: JsonPropertyName("cart")] ShoppingCartModel Cart);