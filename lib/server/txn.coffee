# txn singleton
txn = module.exports =
  ver:
    server: (tol) -> tol[0]
    client: (tol) -> parseInt tol[1].split('.')[1], 10
  id: (tol) -> tol[1]
  clientId: (tol) -> tol[1].split('.')[0]
  method: (tol) -> tol[2]
  path: (tol) -> tol[3]
  args: (tol) -> tol.slice(4)
  eval: (txn, start) ->
    return @args(txn)[0] if @method(txn) == 'set'
  isConflict: (txnA, val, ver) ->
    if arguments.length == 2
      txnB = val
      return false if @clientId(txnA) == @clientId(txnB) || @path(txnA) != @path(txnB)
      argsA = @args(txnA)
      argsB = @args(txnB)
      return false if argsA.length != argsB.length
      for argA, i in argsA
        return false if argA == argsB[i]
      return true

    return @eval(txnA) != val && @base(txnA) <= ver

txn.base = txn.ver.server