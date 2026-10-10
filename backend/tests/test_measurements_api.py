"""Integration tests for Body Measurements API and recommendation integration."""

import pytest


def test_measurements_save_valid_cm(client):
    headers = {"X-User-ID": "user_meas_cm"}
    payload = {
        "height": 175.0,
        "shoulder": 44.0,
        "chest_bust": 98.0,
        "waist": 78.0,
        "hips": 98.0,
        "unit": "cm",
    }
    res = client.post("/api/v1/measurements", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.get_json()
    assert data["height"] == 175.0
    assert data["unit"] == "cm"
    assert data["derived_body_shape"] is not None
    assert data["measurements_missing"] is False
    assert "ratios" in data


def test_measurements_save_valid_inches(client):
    headers = {"X-User-ID": "user_meas_in"}
    # 68 inches ~ 172.7 cm
    payload = {
        "height": 68.0,
        "shoulder": 17.5,
        "chest_bust": 38.0,
        "waist": 30.0,
        "hips": 38.0,
        "unit": "in",
    }
    res = client.post("/api/v1/measurements", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.get_json()
    assert data["unit"] == "in"
    # raw_cm should store centimeters
    assert abs(data["raw_cm"]["height_cm"] - (68.0 * 2.54)) < 0.5


def test_measurements_validation_422_unrealistic_bounds(client):
    headers = {"X-User-ID": "user_meas_err"}

    # Unrealistic height (350 cm > 260 cm limit)
    res_height = client.post(
        "/api/v1/measurements",
        json={"height": 350.0, "shoulder": 40.0, "chest_bust": 90.0, "waist": 70.0, "hips": 90.0},
        headers=headers,
    )
    assert res_height.status_code == 422
    data = res_height.get_json()
    assert "Measurement validation failed" in data["error"]

    # Unrealistic waist (15 cm < 40 cm limit)
    res_waist = client.post(
        "/api/v1/measurements",
        json={"height": 170.0, "shoulder": 40.0, "chest_bust": 90.0, "waist": 15.0, "hips": 90.0},
        headers=headers,
    )
    assert res_waist.status_code == 422


def test_measurements_lifecycle_and_delete(client):
    headers = {"X-User-ID": "user_lifecycle"}

    # 1. Initially measurements are missing
    res_init = client.get("/api/v1/measurements", headers=headers)
    assert res_init.status_code == 200
    assert res_init.get_json()["measurements_missing"] is True

    # 2. Save measurements
    payload = {
        "height": 168.0,
        "shoulder": 38.0,
        "chest_bust": 88.0,
        "waist": 66.0,
        "hips": 90.0,
    }
    res_save = client.post("/api/v1/measurements", json=payload, headers=headers)
    assert res_save.status_code == 201

    # 3. View saved measurements
    res_view = client.get("/api/v1/measurements", headers=headers)
    assert res_view.status_code == 200
    data = res_view.get_json()
    assert data["measurements_missing"] is False
    assert data["height"] == 168.0

    # 4. Override shape
    res_override = client.patch(
        "/api/v1/measurements/shape-override",
        json={"custom_body_shape": "athletic"},
        headers=headers,
    )
    assert res_override.status_code == 200
    assert res_override.get_json()["effective_body_shape"] == "athletic"

    # 5. Permanently delete measurements
    res_del = client.delete("/api/v1/measurements", headers=headers)
    assert res_del.status_code == 200
    assert res_del.get_json()["measurements_missing"] is True

    # 6. Verify measurements are permanently gone
    res_after = client.get("/api/v1/measurements", headers=headers)
    assert res_after.status_code == 200
    assert res_after.get_json()["measurements_missing"] is True


def test_recommendations_measurements_missing_flag(client, sample_wardrobe):
    # When user has no measurements, recommendations succeed with measurements_missing: True
    headers = {"X-User-ID": "user_no_meas"}
    res = client.post("/api/v1/recommendations", json={"occasion": "casual"}, headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["measurements_missing"] is True

    # Add measurements for user
    meas_payload = {
        "height": 175.0,
        "shoulder": 45.0,
        "chest_bust": 96.0,
        "waist": 78.0,
        "hips": 96.0,
    }
    client.post("/api/v1/measurements", json=meas_payload, headers=headers)

    # Recommendations now have measurements_missing: False
    res_with_meas = client.post("/api/v1/recommendations", json={"occasion": "casual"}, headers=headers)
    assert res_with_meas.status_code == 200
    data_with_meas = res_with_meas.get_json()
    assert data_with_meas["measurements_missing"] is False
