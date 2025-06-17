class CacheSettings:
    def __init__(self, expiration: int = 10, params: list[str] = []) -> None:
        self.expiration = expiration
        self.params = tuple(set(params))
