namespace Ordering.Infrastructure.Data.Extensions;

public static class InitialData
{
    // Static IDs للـ Customers
    private static readonly Guid AhmedId = new Guid("C1111111-1111-1111-1111-111111111111");
    private static readonly Guid AliId = new Guid("C2222222-2222-2222-2222-222222222222");

    // Static IDs للـ Products
    private static readonly Guid Iphone17Id = new Guid("11111111-1111-1111-1111-111111111111");
    private static readonly Guid SamsungS25Id = new Guid("22222222-2222-2222-2222-222222222222");
    private static readonly Guid Pixel9Id = new Guid("33333333-3333-3333-3333-333333333333");
    private static readonly Guid OnePlus13Id = new Guid("44444444-4444-4444-4444-444444444444");
    private static readonly Guid Xiaomi15Id = new Guid("55555555-5555-5555-5555-555555555555");
    private static readonly Guid Iphone16ProId = new Guid("66666666-6666-6666-6666-666666666666");
    private static readonly Guid SamsungFoldId = new Guid("77777777-7777-7777-7777-777777777777");
    private static readonly Guid NothingPhoneId = new Guid("88888888-8888-8888-8888-888888888888");
    private static readonly Guid RealmeGt6Id = new Guid("99999999-9999-9999-9999-999999999999");
    private static readonly Guid HonorMagic7Id = new Guid("AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA");

    // Static IDs للـ Orders ← هنا المشكلة! غيرت الـ O لـ 0
    private static readonly Guid Order1Id = new Guid("01111111-1111-1111-1111-111111111111");
    private static readonly Guid Order2Id = new Guid("02222222-2222-2222-2222-222222222222");
    private static readonly Guid Order3Id = new Guid("03333333-3333-3333-3333-333333333333");

    public static IEnumerable<Customer> Customers => new List<Customer>
    {
        Customer.Create(CustomerId.Of(AhmedId), "Ahmed", "ahmed@test.com"),
        Customer.Create(CustomerId.Of(AliId), "Ali", "ali@tes.com")
    };

    public static IEnumerable<Product> Products => new List<Product>
    {
        Product.Create(ProductId.Of(Iphone17Id), "iPhone 17", 150),
        Product.Create(ProductId.Of(SamsungS25Id), "Samsung Galaxy S25", 120),
        Product.Create(ProductId.Of(Pixel9Id), "Google Pixel 9", 100),
        Product.Create(ProductId.Of(OnePlus13Id), "OnePlus 13", 90),
        Product.Create(ProductId.Of(Xiaomi15Id), "Xiaomi 15", 80),
        Product.Create(ProductId.Of(Iphone16ProId), "iPhone 16 Pro", 140),
        Product.Create(ProductId.Of(SamsungFoldId), "Samsung Galaxy Z Fold", 200),
        Product.Create(ProductId.Of(NothingPhoneId), "Nothing Phone 3", 70),
        Product.Create(ProductId.Of(RealmeGt6Id), "Realme GT 6", 60),
        Product.Create(ProductId.Of(HonorMagic7Id), "Honor Magic 7", 85)
    };

    public static List<Order> OrderWithItems
    {
        get
        {
            var products = Products.ToList();
            var customers = Customers.ToList();

            var order1 = Order.Create(
                OrderId.Of(Order1Id),
                customers[0].Id,
               
                Address.Of("Ahmed", "Hassan", "ahmed@test.com", "Cairo", "Egypt", "123 Street", "10001"),
                Address.Of("Ahmed", "Hassan", "ahmed@test.com", "Cairo", "Egypt", "123 Street", "10001"),
                Payment.Of("Ahmed Hassan", "4111111111111111", "12/28", "123", 1)
            );
            order1.Add(products[0].Id, products[0].Name, 2, products[0].Price);   // iPhone 17 x2
            order1.Add(products[1].Id, products[1].Name, 1, products[1].Price);   // Samsung S25 x1

            var order2 = Order.Create(
                OrderId.Of(Order2Id),
                customers[1].Id,
              
                Address.Of("Ali", "Mohamed", "ali@tes.com", "Alexandria", "Egypt", "456 Street", "20002"),
                Address.Of("Ali", "Mohamed", "ali@tes.com", "Alexandria", "Egypt", "456 Street", "20002"),
                Payment.Of("Ali Mohamed", "4222222222222222", "11/27", "456", 2)
            );
            order2.Add(products[2].Id, products[2].Name, 1, products[2].Price);   // Pixel 9 x1
            order2.Add(products[3].Id, products[3].Name, 2, products[3].Price);   // OnePlus 13 x2
            order2.Add(products[4].Id, products[4].Name, 1, products[4].Price);   // Xiaomi 15 x1

            var order3 = Order.Create(
                OrderId.Of(Order3Id),
                customers[0].Id,
               
                Address.Of("Ahmed", "Hassan", "ahmed@test.com", "Cairo", "Egypt", "123 Street", "10001"),
                Address.Of("Ahmed", "Hassan", "ahmed@test.com", "Cairo", "Egypt", "123 Street", "10001"),
                Payment.Of("Ahmed Hassan", "4333333333333333", "10/29", "789", 1)
            );
            order3.Add(products[5].Id, products[5].Name, 1, products[5].Price);   // iPhone 16 Pro x1
            order3.Add(products[6].Id, products[6].Name, 1, products[6].Price);   // Galaxy Z Fold x1

            return new List<Order> { order1, order2, order3 };
        }
    }
}