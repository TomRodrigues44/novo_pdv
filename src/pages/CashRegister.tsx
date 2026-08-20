<Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <Receipt className="h-5 w-5" />
                    Adições
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Adições:</span>
                      <span className="text-xl font-bold text-amber-600">
                        {formatCurrency(
                          currentRegister.transactions?.filter((t: any) => t.type === 'addition').reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0
                        )}
                      </span>
                    </div>
                    
                    <Dialog open={isAdditionDialogOpen} onOpenChange={setIsAdditionDialogOpen}>
                      <Button 
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        onClick={() => setIsAdditionDialogOpen(true)}
                      >
                        <Receipt className="mr-2 h-4 w-4" />
                        Nova Adição
                      </Button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registrar Adição</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Valor
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={transactionAmount}
                              onChange={(e) => setTransactionAmount(e.target.value)}
                              placeholder="Ex: 100.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Descrição
                            </label>
                            <Textarea
                              value={transactionDescription}
                              onChange={(e) => setTransactionDescription(e.target.value)}
                              placeholder="Ex: Diária funcionário João..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAdditionDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleTransaction('addition')}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            Confirmar Adição
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {currentRegister.transactions?.filter((t: any) => t.type === 'addition').length > 0 && (
                      <div className="space-y-2 mt-4">
                        {currentRegister.transactions
                          .filter((t: any) => t.type === 'addition')
                          .map((trans: any) => (
                            <div key={trans.id} className="flex justify-between items-center p-2 bg-amber-50 rounded text-sm">
                              <div>
                                <p className="font-medium">{trans.description || 'Sem descrição'}</p>
                                <p className="text-xs text-gray-500">{formatDateTime(trans.created_at)}</p>
                              </div>
                              <span className="font-bold text-amber-600">
                                -{formatCurrency(parseFloat(trans.amount))}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="h-5 w-5 text-green-600" />
                  Abrir Caixa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Para iniciar as vendas, você precisa abrir o caixa informando o valor inicial em dinheiro.
                </p>
                <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 w-full"
                    onClick={() => setIsOpenDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Abrir Novo Caixa
                  </Button>
                </DialogContent>
              </CardContent>
            </Card>
          )}

        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Histórico de Fechamentos</h2>
            <div className="space-y-4">
              {history.map((register: any) => (
                <Card key={register.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {formatDateTime(register.closed_at)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {register.difference > 0 ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-semibold">
                              +{formatCurrency(register.difference)}
                            </span>
                          </div>
                        ) : register.difference < 0 ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="h-4 w-4" />
                            <span className="font-semibold">
                              {formatCurrency(register.difference)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-blue-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-semibold">Exato</span>
                          </div>
                        )}
                        
                        {/* AÇões: Impressão e Email */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintHistorical(register)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            title="Imprimir relatório"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendEmail(register)}
                            disabled={sendingEmail === register.id}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Enviar relatório por e-mail"
                          >
                            {sendingEmail === register.id ? (
                              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Abertura</p>
                        <p className="font-semibold">{formatCurrency(register.opening_amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Vendas</p>
                        <p className="font-semibold text-green-600">{formatCurrency(register.expected_amount - register.opening_amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Esperado</p>
                        <p className="font-semibold text-orange-600">{formatCurrency(register.expected_amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Contado</p>
                        <p className="font-semibold">{formatCurrency(register.closing_amount)}</p>
                      </div>
                    </div>
                    {register.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500">Observações: {register.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashRegister;