useEffect(() => {
  if (!isReceiptOpen && receiptData) {
    handleSendEmail(receiptData);
  }, [isReceiptOpen, receiptData, handleSendEmail]);