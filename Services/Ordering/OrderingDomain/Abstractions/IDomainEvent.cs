using MediatR;


namespace OrderingDomain.Abstractions
{
    public interface IDomainEvent : INotification
    {
        Guid Id => Guid.NewGuid();
        public DateTime OccuredOn => DateTime.UtcNow;
        public string EventType => GetType().AssemblyQualifiedName!;
    }
}
