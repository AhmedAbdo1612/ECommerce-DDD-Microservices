using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildingBlocks.CQRS
{

    public interface ICommandHandler<in TCommand>: ICommandHandler<TCommand,Unit> where TCommand : ICommand<Unit>
    {

    }
    public interface ICommandHandler<in TCommand, TResponse>: IRequestHandler<TCommand, TResponse>
        where TCommand : ICommand<TResponse> where TResponse :notnull
    {
    }
}
