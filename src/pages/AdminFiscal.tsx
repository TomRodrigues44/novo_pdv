const handleSaveCompanyConfig = async () => {
    try {
      const response = await fetch('/api/fiscal/company_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: companyConfig.cnpj,
          razao_social: companyConfig.razao_social,
          nome_fantasia: companyConfig.nome_fantasia,
          inscricao_estadual: companyConfig.inscricao_estadual || null,
          inscricao_municipal: companyConfig.inscricao_municipal || null,
          cnae: companyConfig.cnae || null,
          cnpj_matriz: companyConfig.cnpj_matriz || null,
          regime_tributario: companyConfig.regime_tributario,
          CRT: companyConfig.CRT,
          cep: companyConfig.cep || null,
          logradouro: companyConfig.logradouro || null,
          numero: companyConfig.numero || null,
          complemento: companyConfig.complemento || null,
          bairro: companyConfig.bairro || null,
          municipio: companyConfig.municipio || null,
          uf: companyConfig.uf,
          telefone: companyConfig.telefone || null,
          email: companyConfig.email || null,
          ambiente: companyConfig.ambiente,
          serie_nfe: parseInt(String(companyConfig.serie_nfe || 1)),
          serie_nfce: parseInt(String(companyConfig.serie_nfce || 15)),
          ultima_nfe: parseInt(String(companyConfig.ultima_nfe || 15200)),
          ultima_nfce: parseInt(String(companyConfig.ultima_nfce || 15200)),
        }),
      });

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        try {
          const error = await response.json();
          toast.error(error.statusMessage || 'Erro ao salvar configurações');
        } catch (e) {
          toast.error('Erro ao salvar configurações');
        }
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };