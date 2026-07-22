namespace Shopping.Web.Models.Ordering;

public record OrderModel(Guid Id,
    Guid CustomerId,
    string OrderName,
    AddressModel ShippingAddress,
    AddressModel BillingAddress,
    PaymentModel Payment,
    OrderStatus Status,
    List<OrderItemModel> OrderItems);

public record OrderItemModel(Guid OrderId, Guid ProductId, string ProductName, int Quantity, float Price);

public record AddressModel(string FirstName,
    string LastName,
    string EmailAddress,
    string AddressLine,
    string Country,
    string State,
    string ZipCode);

public record PaymentModel(
    string CardName,
    string CardNumber,
    string Expiration,
    string Cvv,
    int PaymentMethod
    );

public enum OrderStatus
{
    Draft = 1,
    Pending = 2,
    Completed = 3,
    Cancelled = 4,
}

public record GetOrdersResponse(IEnumerable<OrderModel> orders);
public record GetOrdersByNameResponse(IEnumerable<OrderModel> orders);
public record GetOrdersByCustomerResponse(IEnumerable<OrderModel> orders);
public record UpdateOrderRequest(OrderModel order);
public record UpdateOrderResponse(bool IsSuccess);
public record DeleteOrderResponse(bool IsSuccess);
public record GetOrderByIdResponse(OrderModel Order);

// ── View-models for the Edit page ─────────────────────────────────────────────
// These use regular classes with settable properties so ASP.NET Core's
// model binder can reconstruct them from HTML form fields.

public class EditAddressViewModel
{
    public string FirstName    { get; set; } = string.Empty;
    public string LastName     { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string AddressLine  { get; set; } = string.Empty;
    public string Country      { get; set; } = string.Empty;
    public string State        { get; set; } = string.Empty;
    public string ZipCode      { get; set; } = string.Empty;
}

public class EditPaymentViewModel
{
    public string CardName      { get; set; } = string.Empty;
    public string CardNumber    { get; set; } = string.Empty;
    public string Expiration    { get; set; } = string.Empty;
    public string Cvv           { get; set; } = string.Empty;
    public int    PaymentMethod { get; set; }
}

public class EditOrderItemViewModel
{
    public Guid   OrderId     { get; set; }
    public Guid   ProductId   { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int    Quantity    { get; set; }
    public float  Price       { get; set; }
    /// <summary>When true the item is removed from the order on save.</summary>
    public bool   Delete      { get; set; }
}

public class EditOrderViewModel
{
    public Guid   Id         { get; set; }
    public Guid   CustomerId { get; set; }
    public string OrderName  { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }

    public EditAddressViewModel ShippingAddress { get; set; } = new();
    public EditAddressViewModel BillingAddress  { get; set; } = new();
    public EditPaymentViewModel Payment         { get; set; } = new();
    public List<EditOrderItemViewModel> OrderItems { get; set; } = new();

    // ── mapping helpers ───────────────────────────────────────────────────────

    public static EditOrderViewModel FromOrderModel(OrderModel order) => new()
    {
        Id         = order.Id,
        CustomerId = order.CustomerId,
        OrderName  = order.OrderName,
        Status     = order.Status,
        ShippingAddress = new EditAddressViewModel
        {
            FirstName    = order.ShippingAddress.FirstName,
            LastName     = order.ShippingAddress.LastName,
            EmailAddress = order.ShippingAddress.EmailAddress,
            AddressLine  = order.ShippingAddress.AddressLine,
            Country      = order.ShippingAddress.Country,
            State        = order.ShippingAddress.State,
            ZipCode      = order.ShippingAddress.ZipCode,
        },
        BillingAddress = new EditAddressViewModel
        {
            FirstName    = order.BillingAddress.FirstName,
            LastName     = order.BillingAddress.LastName,
            EmailAddress = order.BillingAddress.EmailAddress,
            AddressLine  = order.BillingAddress.AddressLine,
            Country      = order.BillingAddress.Country,
            State        = order.BillingAddress.State,
            ZipCode      = order.BillingAddress.ZipCode,
        },
        Payment = new EditPaymentViewModel
        {
            CardName      = order.Payment.CardName,
            CardNumber    = order.Payment.CardNumber,
            Expiration    = order.Payment.Expiration,
            Cvv           = order.Payment.Cvv,
            PaymentMethod = order.Payment.PaymentMethod,
        },
        OrderItems = order.OrderItems.Select(i => new EditOrderItemViewModel
        {
            OrderId     = i.OrderId,
            ProductId   = i.ProductId,
            ProductName = i.ProductName,
            Quantity    = i.Quantity,
            Price       = i.Price,
        }).ToList(),
    };

    public OrderModel ToOrderModel() => new(
        Id:              Id,
        CustomerId:      CustomerId,
        OrderName:       OrderName,
        Status:          Status,
        ShippingAddress: new AddressModel(
            ShippingAddress.FirstName,
            ShippingAddress.LastName,
            ShippingAddress.EmailAddress,
            ShippingAddress.AddressLine,
            ShippingAddress.Country,
            ShippingAddress.State,
            ShippingAddress.ZipCode),
        BillingAddress: new AddressModel(
            BillingAddress.FirstName,
            BillingAddress.LastName,
            BillingAddress.EmailAddress,
            BillingAddress.AddressLine,
            BillingAddress.Country,
            BillingAddress.State,
            BillingAddress.ZipCode),
        Payment: new PaymentModel(
            Payment.CardName,
            Payment.CardNumber,
            Payment.Expiration,
            Payment.Cvv,
            Payment.PaymentMethod),
        OrderItems: OrderItems
            .Where(i => !i.Delete)
            .Select(i => new OrderItemModel(i.OrderId, i.ProductId, i.ProductName, i.Quantity, i.Price))
            .ToList()
    );
}
