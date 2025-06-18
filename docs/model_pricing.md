# Model Pricing Configuration

Model usage costs are defined in `config/model_pricing.yaml`. The file maps a model name to its cost per thousand tokens:

```yaml
default: 0.002
gpt-4o: 0.005
gpt-4.1-mini: 0.003
claude-3: 0.004
```

Update values or add new models in this file and restart the backend. `get_cost_estimate` reads the file at runtime so pricing changes take effect without code modifications.
