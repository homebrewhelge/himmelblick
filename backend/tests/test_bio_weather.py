"""Unit-Tests für Biowetter-Berechnungsfunktionen."""
import pytest
from app.services.bio_weather import (
    compute_heat_index,
    compute_windchill,
    compute_humidex,
    compute_pet,
    compute_comfort_recommendations,
)


class TestHeatIndex:
    def test_hot_humid(self):
        hi = compute_heat_index(35, 80)
        assert hi is not None
        assert hi > 35

    def test_below_threshold(self):
        assert compute_heat_index(25, 80) is None

    def test_low_humidity(self):
        assert compute_heat_index(35, 30) is None

    def test_result_type(self):
        hi = compute_heat_index(30, 70)
        assert hi is None or isinstance(hi, float)


class TestWindchill:
    def test_cold_windy(self):
        wc = compute_windchill(-5, 50)
        assert wc is not None
        assert wc < -5

    def test_warm_temp(self):
        assert compute_windchill(12, 50) is None

    def test_calm_wind(self):
        assert compute_windchill(-5, 3) is None

    def test_boundary(self):
        wc = compute_windchill(10, 4.8)
        assert wc is not None


class TestHumidex:
    def test_hot_humid(self):
        h = compute_humidex(30, 25)
        assert h is not None
        assert h > 30

    def test_cold_temp(self):
        assert compute_humidex(15, 10) is None


class TestPET:
    def test_basic_calculation(self):
        pet = compute_pet(20, 50, 2.0, 400)
        assert pet is not None
        assert isinstance(pet, float)

    def test_cold_windy(self):
        pet = compute_pet(-5, 80, 10, 0)
        assert pet is not None
        assert pet < 0


class TestComfortRecommendations:
    def test_returns_list(self):
        recs = compute_comfort_recommendations(22, 50, 15, 0, 3, 30)
        assert isinstance(recs, list)
        assert len(recs) > 0

    def test_all_have_id_label_ok(self):
        recs = compute_comfort_recommendations(22, 50, 15, 0, 3, 30)
        for r in recs:
            assert 'id' in r
            assert 'label' in r
            assert 'ok' in r
            assert isinstance(r['ok'], bool)

    def test_grillen_ok_bei_schoenem_wetter(self):
        recs = compute_comfort_recommendations(25, 50, 10, 0, 4, 20)
        grillen = next((r for r in recs if r['id'] == 'grillen'), None)
        assert grillen is not None
        assert grillen['ok'] is True

    def test_grillen_not_ok_bei_regen(self):
        recs = compute_comfort_recommendations(25, 80, 10, 5, 1, 90)
        grillen = next((r for r in recs if r['id'] == 'grillen'), None)
        assert grillen is not None
        assert grillen['ok'] is False
